import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Zap, ChevronRight, Package, Shield, Headphones, Clock } from 'lucide-react';
import { productService, categoryService, bannerService, flashSaleService } from '@/services/firestore';
import useStore from '@/stores/useStore';
import type { Product, Category, Banner, FlashSale } from '@/types';

// Product Card Component
function ProductCard({ product, index }: { product: Product; index: number }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
    >
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.coverImages[0] || '/placeholder-product.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        {product.badge && (
          <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded ${
            product.badge === 'flash_sale' ? 'bg-orange-500 text-white' :
            product.badge === 'bestseller' ? 'bg-yellow-500 text-black' :
            product.badge === 'subscription' ? 'bg-blue-500 text-white' :
            'bg-purple-500 text-white'
          }`}>
            {product.badge === 'flash_sale' ? 'Flash Sale' :
             product.badge === 'bestseller' ? 'Best Seller' :
             product.badge === 'subscription' ? 'Berlangganan' : 'Terlaris'}
          </span>
        )}
      </Link>
      <div className="p-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-purple-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${star <= Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
          <span className="text-xs text-muted-foreground ml-auto">{product.soldCount || 0} terjual</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {product.discountPrice ? (
              <>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  Rp {product.discountPrice.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-muted-foreground line-through ml-1">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <svg
              className={`w-4 h-4 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton Product Card
function ProductSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-shimmer">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

// Countdown Timer
function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2">
      {['hours', 'minutes', 'seconds'].map((unit, i) => (
        <div key={unit} className="flex items-center gap-2">
          <div className="bg-black text-white dark:bg-white dark:text-black text-sm font-bold px-2 py-1 rounded">
            {String(timeLeft[unit as keyof typeof timeLeft]).padStart(2, '0')}
          </div>
          {i < 2 && <span className="text-white font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, bannersData, flashSalesData] = await Promise.all([
        productService.getProducts({ limit: 12 }),
        categoryService.getCategories(),
        bannerService.getActiveBanners(),
        flashSaleService.getActiveFlashSales(),
      ]);
      setProducts(productsData.products);
      setCategories(categoriesData);
      setBanners(bannersData);
      setFlashSales(flashSalesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = activeCategory
    ? products.filter((p) => p.categoryId === activeCategory)
    : products;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      {banners.length > 0 && (
        <section className="relative overflow-hidden">
          <Link to={banners[0].link || '/products'} className="block relative aspect-[21/9] md:aspect-[3/1]">
            <img
              src={banners[0].imageUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center p-6 md:p-12">
              <div className="max-w-lg">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-4xl font-bold text-white mb-2"
                >
                  {categories[0]?.name || 'Produk Digital Terbaik'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80 text-sm md:text-base mb-4"
                >
                  Temukan produk digital berkualitas dengan harga terbaik
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Lihat Produk
                </motion.button>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Flash Sale */}
      {flashSales.length > 0 && (
        <section className="px-4 py-6 md:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-300" />
                <h2 className="text-xl font-bold text-white">Flash Sale</h2>
                <CountdownTimer endTime={flashSales[0].endTime as unknown as string} />
              </div>
              <Link to="/products?flash_sale=true" className="text-white/80 hover:text-white text-sm flex items-center gap-1">
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {flashSales.slice(0, 6).map((sale) => (
                <Link
                  key={sale.id}
                  to={`/products/${sale.productId}`}
                  className="bg-white/10 backdrop-blur rounded-xl overflow-hidden hover:bg-white/20 transition-all"
                >
                  <div className="aspect-square bg-white/5">
                    {/* Product image will load from product data */}
                  </div>
                  <div className="p-2">
                    <p className="text-white text-xs font-medium">Flash Sale</p>
                    <p className="text-yellow-300 text-sm font-bold">
                      Rp {sale.salePrice.toLocaleString('id-ID')}
                    </p>
                    <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-yellow-400 h-1.5 rounded-full"
                        style={{ width: `${(sale.soldCount / sale.quota) * 100}%` }}
                      />
                    </div>
                    <p className="text-white/60 text-xs mt-1">{sale.soldCount}/{sale.quota} terjual</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="px-4 py-6 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-lg font-bold mb-4">Kategori</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeCategory
                  ? 'bg-purple-600 text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="px-4 py-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {activeCategory ? categories.find((c) => c.id === activeCategory)?.name || 'Produk' : 'Produk Unggulan'}
          </h2>
          <Link to="/products" className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada produk</p>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="px-4 py-8 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, title: 'Produk Digital', desc: 'Akses instant setelah pembayaran' },
            { icon: Shield, title: 'Aman Terpercaya', desc: 'Garansi uang kembali 7 hari' },
            { icon: Headphones, title: 'Support 24/7', desc: 'Tim support siap membantu' },
            { icon: Clock, title: 'Pengiriman Cepat', desc: 'Download link otomatis via email' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <feature.icon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-medium text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
