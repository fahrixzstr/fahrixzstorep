import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import useStore from '@/stores/useStore';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isLoggedIn,
    user,
    setShowGuestPrompt,
  } = useStore();

  // Save cart to Firestore for logged in users
  useEffect(() => {
    if (isLoggedIn && user?.uid && cart.length > 0) {
      import('@/services/firestore').then(({ cartService }) => {
        cartService.saveCart(user.uid, cart);
      });
    }
  }, [cart, isLoggedIn, user]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Keranjang belanja kosong');
      return;
    }

    if (!isLoggedIn) {
      // Show guest prompt
      setShowGuestPrompt(true);
      toast.info('Silakan login terlebih dahulu untuk melanjutkan checkout');
      navigate('/login', { state: { redirect: '/checkout' } });
      return;
    }

    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Keranjang Belanja Kosong</h2>
          <p className="text-muted-foreground mb-4">Belum ada produk di keranjang Anda</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl transition-colors"
          >
            <Package className="w-4 h-4" />
            Mulai Belanja
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja ({getCartCount()} item)</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border rounded-xl p-4 flex gap-4"
            >
              <Link to={`/products/${item.productId}`} className="w-24 h-24 flex-shrink-0">
                <img
                  src={item.product.coverImages[0] || '/placeholder-product.png'}
                  alt={item.product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`}>
                  <h3 className="font-medium line-clamp-2 hover:text-purple-500 transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.product.fileType?.toUpperCase() || 'Digital'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      Rp {(item.product.discountPrice || item.product.price).toLocaleString('id-ID')}
                    </span>
                    {item.product.discountPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        Rp {item.product.price.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium border-x border-border">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.productId);
                        toast.success('Produk dihapus dari keranjang');
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <button
            onClick={() => {
              clearCart();
              toast.success('Keranjang dikosongkan');
            }}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            Kosongkan Keranjang
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-4">
            <h2 className="font-bold mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({getCartCount()} item)</span>
                <span>Rp {getCartTotal().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diskon</span>
                <span className="text-green-600">-Rp 0</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-purple-600 dark:text-purple-400 text-lg">
                  Rp {getCartTotal().toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/products"
              className="block text-center text-sm text-purple-600 hover:text-purple-700 mt-3"
            >
              Lanjutkan Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
