'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import SizeColorManager from '@/components/admin/SizeColorManager';
import type { Product, Category, Brand, ProductColor } from '@/lib/types';

interface ProductForm {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  brandId: string;
  brandName: string;
  categoryId: string;
  images: string;
  colors: ProductColor[];
  sizes: string[];
  specifications: string;
  stock: number;
  isBestSeller: boolean;
  isNew: boolean;
  isOnSale: boolean;
  rating: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

const createEmptyFormData = (): ProductForm => ({
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  discount: 0,
  brandId: '',
  brandName: '',
  categoryId: '',
  images: '',
  colors: [],
  sizes: [],
  specifications: '',
  stock: 0,
  isBestSeller: false,
  isNew: false,
  isOnSale: false,
  rating: 0,
  weight: undefined,
  length: undefined,
  width: undefined,
  height: undefined,
});

function formatSpecifications(specifications?: Record<string, string>) {
  if (!specifications) return '';
  return Object.entries(specifications)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function parseSpecifications(value: string): Record<string, string> {
  if (!value?.trim()) return {};

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).map(([key, itemValue]) => [key, String(itemValue)])
      );
    }
  } catch {
    // Fall back to line-based parsing below.
  }

  const specs: Record<string, string> = {};
  value.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const separatorIndex = trimmed.search(/[:|]/);
    if (separatorIndex === -1) {
      specs[trimmed] = '';
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const itemValue = trimmed.slice(separatorIndex + 1).trim();

    if (key) {
      specs[key] = itemValue;
    }
  });

  return specs;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductForm>(createEmptyFormData());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/categories'),
        fetch('/api/brands'),
      ]);

      setProducts(await productsRes.json());
      setCategories(await categoriesRes.json());
      setBrands(await brandsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'خطا در دریافت داده‌ها' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    const matchedBrand = brands.find((brand) => brand.id === product.brandId);

    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      brandId: product.brandId,
      brandName: matchedBrand?.name ?? '',
      categoryId: product.categoryId,
      images: product.images.join('\n'),
      colors: product.colors,
      sizes: product.sizes,
      specifications: formatSpecifications(product.specifications),
      stock: product.stock,
      isBestSeller: product.isBestSeller,
      isNew: product.isNew,
      isOnSale: product.isOnSale,
      rating: product.rating,
      weight: product.weight,
      length: product.length,
      width: product.width,
      height: product.height,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imageArray = formData.images
        .split('\n')
        .map((img) => img.trim())
        .filter((img) => img.length > 0);

      const payload = {
        id: editingId || undefined,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        discount: formData.discount ? Number(formData.discount) : undefined,
        stock: Number(formData.stock),
        rating: Number(formData.rating),
        brandId: formData.brandId,
        brandName: formData.brandName.trim() || undefined,
        categoryId: formData.categoryId,
        images: imageArray,
        sizes: Array.isArray(formData.sizes) ? formData.sizes : [],
        colors: Array.isArray(formData.colors) ? formData.colors : [],
        specifications: parseSpecifications(formData.specifications),
        isBestSeller: Boolean(formData.isBestSeller),
        isNew: Boolean(formData.isNew),
        isOnSale: Boolean(formData.isOnSale),
        weight: formData.weight ? Number(formData.weight) : undefined,
        length: formData.length ? Number(formData.length) : undefined,
        width: formData.width ? Number(formData.width) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
      };

      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }

      setMessage({ type: 'success', text: editingId ? 'محصول با موفقیت ویرایش شد' : 'محصول با موفقیت اضافه شد' });
      setShowForm(false);
      setEditingId(null);
      setFormData(createEmptyFormData());
      await fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage({ type: 'error', text: 'خطا در ذخیره محصول' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setMessage({ type: 'success', text: 'محصول با موفقیت حذف شد' });
      await fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در حذف محصول' });
    }
  };

  if (loading) {
    return <AdminLayout currentPage="products"><div className="text-center py-12">در حال بارگذاری...</div></AdminLayout>;
  }

  return (
    <AdminLayout currentPage="products">
      <div className="space-y-4">
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <AlertCircle size={20} />
            {message.text}
          </div>
        )}

        <button
          onClick={() => {
            setEditingId(null);
            setFormData(createEmptyFormData());
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          محصول جدید
        </button>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">نام محصول</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">دسته‌بندی</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">قیمت</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">قیمت اصلی</label>
                  <input
                    type="number"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">تخفیف (%)</label>
                  <input
                    type="number"
                    value={formData.discount || ''}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">موجودی</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">نام برند</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثلاً رز گلد"
                  />
                  <p className="mt-1 text-sm text-gray-500">اگر برند قبلاً وجود داشته باشد، از آن استفاده می‌شود؛ در غیر این صورت به‌صورت خودکار اضافه می‌شود.</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">امتیاز</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">لینک‌های عکس (هر خط یک لینک)</label>
                <textarea
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-20"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                />
              </div>

              <div className="border-t pt-6">
                <SizeColorManager
                  sizes={formData.sizes}
                  colors={formData.colors}
                  onSizesChange={(sizes) => setFormData({ ...formData, sizes })}
                  onColorsChange={(colors) => setFormData({ ...formData, colors })}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">مشخصات محصول</label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono text-sm"
                  placeholder='جنس: پنبه&#10;رنگ: مشکی'
                />
                <p className="mt-1 text-sm text-gray-500">هر سطر یک مشخصه است؛ مثال: جنس: پنبه</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">ابعاد و وزن بسته</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">وزن (گرم)</label>
                    <input
                      type="number"
                      value={formData.weight ?? ''}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثلاً 500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">طول (سانتی‌متر)</label>
                    <input
                      type="number"
                      value={formData.length ?? ''}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثلاً 30"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">عرض (سانتی‌متر)</label>
                    <input
                      type="number"
                      value={formData.width ?? ''}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثلاً 20"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">ارتفاع (سانتی‌متر)</label>
                    <input
                      type="number"
                      value={formData.height ?? ''}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثلاً 10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  />
                  <span>پرفروش</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  />
                  <span>جدید</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isOnSale}
                    onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                  />
                  <span>تخفیف دار</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {editingId ? 'ذخیره تغییرات' : 'ایجاد محصول'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-right">نام</th>
                <th className="px-4 py-3 text-right">قیمت</th>
                <th className="px-4 py-3 text-right">موجودی</th>
                <th className="px-4 py-3 text-right">دسته</th>
                <th className="px-4 py-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.price.toLocaleString('fa-IR')} ت</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    {categories.find((c) => c.id === product.categoryId)?.name || '-'}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
