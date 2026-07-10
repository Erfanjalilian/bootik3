'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AlertCircle, Wrench } from 'lucide-react';

export default function OrdersManagement() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return <AdminLayout currentPage="orders"><div className="text-center py-12">در حال بارگذاری...</div></AdminLayout>;
  }

  return (
    <AdminLayout currentPage="orders">
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Wrench className="text-yellow-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-yellow-900 mb-2">این بخش در حال توسعه است</h2>
            <p className="text-yellow-800 mb-4">
              قسمت مدیریت سفارشات هنوز تکمیل نشده است. لطفا بعدا دوباره سعی کنید.
            </p>
            <div className="space-y-2 text-yellow-800 text-sm">
              <p>• نمایش فهرست سفارشات</p>
              <p>• ویرایش وضعیت سفارش</p>
              <p>• مشاهده جزئیات سفارش</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-400 text-4xl font-bold mb-2">-</div>
            <p className="text-gray-600">سفارشات در حال انجام</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-400 text-4xl font-bold mb-2">-</div>
            <p className="text-gray-600">سفارشات تکمیل شده</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-400 text-4xl font-bold mb-2">-</div>
            <p className="text-gray-600">درآمد کل</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
