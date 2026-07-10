'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AlertCircle } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

export default function SettingsManagement() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState({
    siteName: '',
    tagline: '',
    phone: '',
    landline: '',
    address: '',
    email: '',
    aboutTitle: '',
    aboutSubtitle: '',
    aboutStory: '',
    mission: '',
    vision: '',
    instagramUrl: '',
    telegramUrl: '',
    whatsappUrl: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data: SiteSettings = await response.json();
      setSettings(data);
      setFormData({
        siteName: data.siteName,
        tagline: data.tagline,
        phone: data.phone,
        landline: data.landline,
        address: data.address,
        email: data.email,
        aboutTitle: data.about.title,
        aboutSubtitle: data.about.subtitle,
        aboutStory: data.about.story,
        mission: data.about.mission,
        vision: data.about.vision,
        instagramUrl: data.social.instagram,
        telegramUrl: data.social.telegram,
        whatsappUrl: data.social.whatsapp,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'خطا در دریافت تنظیمات' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedSettings: SiteSettings = {
        siteName: formData.siteName,
        tagline: formData.tagline,
        phone: formData.phone,
        landline: formData.landline,
        address: formData.address,
        email: formData.email,
        about: {
          title: formData.aboutTitle,
          subtitle: formData.aboutSubtitle,
          story: formData.aboutStory,
          mission: formData.mission,
          vision: formData.vision,
          values: settings?.about.values || [],
          stats: settings?.about.stats || [],
        },
        social: {
          instagram: formData.instagramUrl,
          telegram: formData.telegramUrl,
          whatsapp: formData.whatsappUrl,
        },
      };

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setMessage({ type: 'success', text: 'تنظیمات با موفقیت ذخیره شدند' });
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'خطا در ذخیره تنظیمات' });
    }
  };

  if (loading) {
    return <AdminLayout currentPage="settings"><div className="text-center py-12">در حال بارگذاری...</div></AdminLayout>;
  }

  return (
    <AdminLayout currentPage="settings">
      <div className="space-y-4">
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <AlertCircle size={20} />
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Site Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">اطلاعات سایت</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">نام سایت</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">شعار سایت</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">شماره تلفن</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">تلفن ثابت</label>
                <input
                  type="tel"
                  value={formData.landline}
                  onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ایمیل</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">آدرس</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* About Page Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">صفحه درباره ما</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">عنوان</label>
                <input
                  type="text"
                  value={formData.aboutTitle}
                  onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">زیرعنوان</label>
                <input
                  type="text"
                  value={formData.aboutSubtitle}
                  onChange={(e) => setFormData({ ...formData, aboutSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">داستان ما</label>
                <textarea
                  value={formData.aboutStory}
                  onChange={(e) => setFormData({ ...formData, aboutStory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-32"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">ماموریت</label>
                  <textarea
                    value={formData.mission}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">چشم‌انداز</label>
                  <textarea
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">شبکه‌های اجتماعی</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">اینستاگرام</label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">تلگرام</label>
                <input
                  type="url"
                  value={formData.telegramUrl}
                  onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://t.me/..."
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">واتس‌اپ</label>
                <input
                  type="url"
                  value={formData.whatsappUrl}
                  onChange={(e) => setFormData({ ...formData, whatsappUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://wa.me/..."
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg transition"
            >
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
