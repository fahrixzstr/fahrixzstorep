import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, query, where, orderBy,
  doc, updateDoc, serverTimestamp, addDoc
} from 'firebase/firestore';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, discountPrice: 0,
    category: '', categoryId: '', tags: '', fileUrl: '',
    fileName: '', fileSize: 0, fileType: '', downloadLimit: 3,
    licenseType: 'none' as 'none' | 'personal' | 'commercial' | 'enterprise', version: '1.0', status: 'active' as 'active' | 'draft',
  });

  const fetchProducts = async () => {
    if (!db) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, 'products'),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    if (!db) return;
    if (!formData.name || !formData.price) {
      toast.error('Nama dan harga wajib diisi');
      return;
    }

    try {
      const productData = {
        ...formData,
        type: 'digital',
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        coverImages: [],
        discountPrice: formData.discountPrice || null,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: 0,
        reviewCount: 0,
        soldCount: 0,
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...productData,
          updatedAt: serverTimestamp(),
        });
        toast.success('Produk diperbarui');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Produk ditambahkan');
      }

      setShowModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await updateDoc(doc(db, 'products', id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
      });
      toast.success('Produk dihapus');
      fetchProducts();
    } catch {
      toast.error('Gagal menghapus produk');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      category: product.category,
      categoryId: product.categoryId,
      tags: product.tags.join(', '),
      fileUrl: product.fileUrl,
      fileName: product.fileName,
      fileSize: product.fileSize,
      fileType: product.fileType,
      downloadLimit: product.downloadLimit,
      licenseType: product.licenseType,
      version: product.version,
      status: product.status,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '', description: '', price: 0, discountPrice: 0,
      category: '', categoryId: '', tags: '', fileUrl: '',
      fileName: '', fileSize: 0, fileType: '', downloadLimit: 3,
      licenseType: 'none', version: '1.0', status: 'active',
    });
    setShowModal(true);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari produk..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium">Produk</th>
                  <th className="text-left p-3 font-medium">Kategori</th>
                  <th className="text-left p-3 font-medium">Harga</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Terjual</th>
                  <th className="text-right p-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                          {product.coverImages[0] ? (
                            <img src={product.coverImages[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 m-auto mt-2.5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.fileType?.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{product.category}</td>
                    <td className="p-3">
                      {product.discountPrice ? (
                        <div>
                          <span className="font-medium">Rp {product.discountPrice.toLocaleString('id-ID')}</span>
                          <span className="text-xs text-muted-foreground line-through ml-1">
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      ) : (
                        <span>Rp {product.price.toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-3">{product.soldCount || 0}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Tidak ada produk</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nama Produk *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Harga *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Harga Diskon</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tags (pisah koma)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">File URL</label>
                <input
                  type="text"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  placeholder="URL file digital (Firebase Storage)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Download Limit</label>
                  <input
                    type="number"
                    value={formData.downloadLimit}
                    onChange={(e) => setFormData({ ...formData, downloadLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipe Lisensi</label>
                  <select
                    value={formData.licenseType}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  >
                    <option value="none">Tidak Ada</option>
                    <option value="personal">Personal</option>
                    <option value="commercial">Commercial</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setEditingProduct(null); }}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Simpan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
