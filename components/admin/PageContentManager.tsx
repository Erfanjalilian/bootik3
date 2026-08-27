'use client';

import { useEffect, useState } from 'react';
import type { SiteSettings } from '@/lib/types';
import { AdminLayout } from './AdminLayout';

const fieldLabels: Record<string, string> = {
  title: 'عنوان',
  subtitle: 'زیرعنوان',
  story: 'داستان ما',
  mission: 'ماموریت',
  vision: 'چشم‌انداز',
  description: 'توضیحات',
  workingHours: 'ساعات کاری',
};

interface Props {
  page: 'about' | 'contact';
}

export default function PageContentManager({ page }: Props) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings').then((response) => response.json()).then((data: SiteSettings) => {
      setSettings(data);
      if (page === 'about') {
        setValues({ title: data.about.title, subtitle: data.about.subtitle, story: data.about.story, mission: data.about.mission, vision: data.about.vision });
        setEnabled(data.about.enabled);
      } else {
        setValues({ title: data.contact.title, description: data.contact.description, workingHours: data.contact.workingHours });
        setEnabled(data.contact.enabled);
      }
    }).catch(() => setMessage('خطا در دریافت محتوا'));
  }, [page]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    const updated = {
      ...settings,
      [page]: { ...settings[page], ...values, enabled },
    };
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setMessage(response.ok ? 'تغییرات ذخیره شد' : 'خطا در ذخیره تغییرات');
  };

  if (!settings) return <AdminLayout currentPage={page}><div className="text-center py-12">در حال بارگذاری...</div></AdminLayout>;

  return (
    <AdminLayout currentPage={page}>
      <form onSubmit={save} className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-5">
        {message && <p className="rounded-lg bg-blue-50 p-3 text-blue-700">{message}</p>}
        <p className="text-gray-600">هر بخشی را که نمی‌خواهید نمایش داده شود، غیرفعال کنید.</p>
        {Object.keys(values).map((key) => (
          <div key={key} className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <label className="font-semibold text-gray-700">{fieldLabels[key]}</label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={enabled[key] ?? true} onChange={(event) => setEnabled({ ...enabled, [key]: event.target.checked })} />
                نمایش این بخش
              </label>
            </div>
            {key === 'story' || key === 'description' ? (
              <textarea value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} className="w-full min-h-28 rounded-lg border border-gray-300 px-3 py-2" />
            ) : (
              <input value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            )}
          </div>
        ))}
        {page === 'about' && (
          <>
            {(['values', 'stats'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" checked={enabled[key] ?? true} onChange={(event) => setEnabled({ ...enabled, [key]: event.target.checked })} />
                نمایش بخش {key === 'values' ? 'ارزش‌ها' : 'آمار'}
              </label>
            ))}
          </>
        )}
        {page === 'contact' && (
          <div className="space-y-2 border-t pt-4">
            {(['phone', 'landline', 'email', 'address'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" checked={enabled[key] ?? true} onChange={(event) => setEnabled({ ...enabled, [key]: event.target.checked })} />
                نمایش {key === 'phone' ? 'موبایل' : key === 'landline' ? 'تلفن ثابت' : key === 'email' ? 'ایمیل' : 'آدرس'}
              </label>
            ))}
          </div>
        )}
        <button type="submit" className="rounded-lg bg-green-600 px-6 py-2 font-bold text-white hover:bg-green-700">ذخیره تغییرات</button>
      </form>
    </AdminLayout>
  );
}
