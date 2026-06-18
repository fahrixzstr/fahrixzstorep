import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Share2, Download, Shield, Clock, Check, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { productService, reviewService } from '@/services/firestore';
import useStore from '@/stores/useStore';
import type { Product, Review } from '@/types';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cart, updateQuantity, toggleWishlist, isInWishlist, addRecentlyViewed } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [productData, reviewsData] = await Promise.all([
          productService.getProduct(id),
          reviewService.getProductReviews(id),
        ]);
        setProduct(productData);
        setReviews(reviewsData);
        if (productData) {
          addRecentlyViewed(id);
          productService.incrementViews(id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + quantity);
    } else {
      addToCart({
        productId: product.id,
        product,
        quantity,
        addedAt: new Date(),
      });
    }
    toast.success('Produk ditambahkan ke keranjang');
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: product?.name || 'Produk FahriXz Store',
      text: product?.description?.slice(0, 100) || '',
      url,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link disalin ke clipboard');
    }
  };

  const discount = product?.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-xl animate-shimmer" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 animate-shimmer" />
            <div className="h-4 bg-muted rounded w-1/2 animate-shimmer" />
            <div className="h-12 bg-muted rounded w-1/3 animate-shimmer" />
            <div className="h-32 bg-muted rounded animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Produk tidak ditemukan</h2>
          <Link to="/products" className="text-purple-600 hover:text-purple-700">
            Kembali ke katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-purple-500">Beranda</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-purple-500">Produk</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden mb-3">
            <img
              src={product.coverImages[selectedImage] || '/placeholder-product.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.coverImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.coverImages.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev < product.coverImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {product.coverImages.length > 1 && (
            <div className="flex gap-2">
              {product.coverImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-purple-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviewCount || 0} ulasan)</span>
              <span className="text-sm text-muted-foreground">| {product.soldCount || 0} terjual</span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-card border border-border rounded-xl p-4">
            {discount > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{discount}%</span>
                <span className="text-muted-foreground line-through">Rp {product.price.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              Rp {(product.discountPrice || product.price).toLocaleString('id-ID')}
            </div>
            {product.isSubscription && product.subscriptionPrice && (
              <p className="text-sm text-muted-foreground mt-1">
                atau Rp {product.subscriptionPrice.toLocaleString('id-ID')}/{product.subscriptionInterval}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Deskripsi</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>Tipe: {product.fileType?.toUpperCase() || 'Digital'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download className="w-4 h-4" />
              <span>Limit: {product.downloadLimit}x download</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Lisensi: {product.licenseType}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Versi: {product.version || '1.0'}</span>
            </div>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-muted text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Jumlah:</span>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-medium border-x border-border">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Tambah ke Keranjang
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 border rounded-xl transition-colors ${
                  isInWishlist(product.id)
                    ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <svg className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <button
                onClick={handleShare}
                className="p-3 border border-border rounded-xl hover:bg-muted transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-medium mb-3">Yang Anda Dapatkan</h3>
            <ul className="space-y-2 text-sm">
              {[
                'File digital original',
                `Akses download ${product.downloadLimit}x`,
                'Link download aktif 7 hari',
                product.licenseType !== 'none' ? `Lisensi ${product.licenseType}` : null,
                'Update gratis (jika tersedia)',
                'Garansi 7 hari',
              ].filter(Boolean).map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Ulasan ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-400">
                    {review.userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.userName}</p>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('id-ID') : ''}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Belum ada ulasan</p>
        )}
      </div>
    </div>
  );
}
