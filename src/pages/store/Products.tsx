import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { productService, categoryService } from '@/services/firestore';
import useStore from '@/stores/useStore';
import type { Product, Category } from '@/types';

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
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

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'newest'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts({
          category: selectedCategory,
          sort: sortBy,
          search: searchQuery,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          limit: 24,
        }),
        categoryService.getCategories(),
      ]);
      setProducts(productsData.products);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, searchQuery, priceRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set('search', searchQuery);
    else params.delete('search');
    setSearchParams(params);
    fetchData();
  };

  const activeFilters = [];
  if (selectedCategory) {
    const catName = categories.find((c) => c.id === selectedCategory)?.name;
    activeFilters.push({ key: 'category', label: `Kategori: ${catName}`, onRemove: () => setSelectedCategory('') });
  }
  if (searchQuery) {
    activeFilters.push({ key: 'search', label: `Pencarian: ${searchQuery}`, onRemove: () => { setSearchQuery(''); setSearchParams({}); } });
  }
  if (sortBy !== 'popular') {
    const sortLabel = sortBy === 'price_asc' ? 'Harga Termurah' : sortBy === 'price_desc' ? 'Harga Termahal' : 'Terbaru';
    activeFilters.push({ key: 'sort', label: `Urutkan: ${sortLabel}`, onRemove: () => setSortBy('popular') });
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk digital..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="popular">Paling Populer</option>
          <option value="price_asc">Harga Termurah</option>
          <option value="price_desc">Harga Termahal</option>
          <option value="newest">Terbaru</option>
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-card border border-border rounded-xl p-4 mb-6"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Harga Minimum</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Harga Maksimum</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                placeholder="10000000"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
            >
              {filter.label}
              <button onClick={filter.onRemove} className="hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-shimmer">
              <div className="aspect-square bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">{products.length} produk ditemukan</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-lg">Produk tidak ditemukan</p>
          <p className="text-muted-foreground text-sm">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      )}
    </div>
  );
}
