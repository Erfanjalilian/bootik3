'use client';

import { useState } from 'react';

export default function LogoUploader({ currentLogo }: { currentLogo: string }) {
  const [logo, setLogo] = useState(currentLogo);
  const [message, setMessage] = useState('');

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo');
    const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!uploadResponse.ok) { setMessage('خطا در آپلود لوگو'); return; }
    const { url } = await uploadResponse.json();
    const settingsResponse = await fetch('/api/admin/settings');
    const settings = await settingsResponse.json();
    const saveResponse = await fetch('/api/admin/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, logoUrl: url }),
    });
    if (saveResponse.ok) { setLogo(url); setMessage('لوگو با موفقیت ذخیره شد'); }
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">لوگوی هدر</h3>
      <div className="flex items-center gap-4">
        {logo && <img src={logo} alt="لوگوی فعلی" className="h-16 w-16 rounded-lg border object-contain" />}
        <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          انتخاب عکس لوگو
          <input type="file" accept="image/*" onChange={upload} className="hidden" />
        </label>
      </div>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
