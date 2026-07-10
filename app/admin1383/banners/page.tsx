'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import type { Banner } from '@/lib/types';

interface BannerForm {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  type: 'hero' | 'ad';
}

export default function BannersManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerForm>({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    type: 'hero',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/banners');
      setBanners(await response.json());
    } catch (error) {
      console.error('Error fetching banners:', error);
      setMessage({ type: 'error', text: 'خطا در دریافت بنرها' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (banner: Banner) => {
    setFormData({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      link: banner.link,
      type: banner.type,
    });
    setEditingId(banner.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save banner');

      setMessage({ type: 'success', text: editingId ? 'بنر با موفقیت ویرایش شد' : 'بنر با موفقیت اضافه شد' });
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        type: 'hero',
      });
      await fetchBanners();
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در ذخیره بنر' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      const response = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setMessage({ type: 'success', text: 'بنر با موفقیت حذف شد' });
      await fetchBanners();
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در حذف بنر' });
    }
  };

  if (loading) {
    return <AdminLayout currentPage="banners"><div className="text-center py-12">در حال بارگذاری...</div></AdminLayout>;
  }

  return (
    <AdminLayout currentPage="banners">
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
            setFormData({
              title: '',
              subtitle: '',
              image: '',
              link: '',
              type: 'hero',
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          بنر جدید
        </button>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">عنوان</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">نوع</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'hero' | 'ad' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="hero">بنر اصلی</option>
                    <option value="ad">تبلیغ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">زیرعنوان</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">لینک عکس</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {formData.image && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">پیش‌نمایش:</p>
                    <img src={formData.image} alt="preview" className="h-40 rounded-lg object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">لینک هدف</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="/shop?category=cat-1"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {editingId ? 'ذخیره تغییرات' : 'ایجاد بنر'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              <div className="relative h-40 bg-gray-200">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                  {banner.type === 'hero' ? 'بنر اصلی' : 'تبلیغ'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800">{banner.title}</h3>
                <p className="text-gray-600 text-sm">{banner.subtitle}</p>
                <p className="text-gray-500 text-xs mt-2 truncate">{banner.link}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEditClick(banner)}
                    className="flex-1 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition flex items-center justify-center gap-1"
                  >
                    <Edit size={16} />
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="flex-1 p-2 bg-red-500 hover:bg-red-600 text-white rounded transition flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
