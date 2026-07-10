'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Package, Image, Users, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalBanners: number;
  totalUsers: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBanners: 0,
    totalUsers: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, bannersRes, usersRes, ordersRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/banners'),
          fetch('/api/admin/users'),
          fetch('/api/admin/orders'),
        ]);

        const products = await productsRes.json();
        const banners = await bannersRes.json();
        const users = await usersRes.json();
        const orders = await ordersRes.json();

        setStats({
          totalProducts: Array.isArray(products) ? products.length : 0,
          totalBanners: Array.isArray(banners) ? banners.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      key: 'totalProducts',
      title: 'کل محصولات',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      key: 'totalBanners',
      title: 'کل بنرها',
      value: stats.totalBanners,
      icon: Image,
      color: 'bg-purple-500',
    },
    {
      key: 'totalUsers',
      title: 'کل کاربران',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      key: 'totalOrders',
      title: 'کل سفارشات',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-orange-500',
    },
  ];

  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {loading ? '-' : card.value}
                    </p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">خوش آمدید به پنل مدیریتی</h3>
              <p className="text-gray-600 mt-2">
                از طریق این پنل می‌توانید محصولات، بنرها، کاربران و سایر اطلاعات سایت را مدیریت کنید.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">مدیریت محصولات</h3>
            <p className="text-gray-600 mb-4">افزودن، ویرایش و حذف محصولات سایت</p>
            <a href="/admin1383/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              مدیریت محصولات
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">مدیریت بنرها</h3>
            <p className="text-gray-600 mb-4">ویرایش بنرهای صفحه اصلی سایت</p>
            <a href="/admin1383/banners" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
              مدیریت بنرها
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">کاربران</h3>
            <p className="text-gray-600 mb-4">مشاهده فهرست کاربران سایت</p>
            <a href="/admin1383/users" className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
              مشاهده کاربران
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">تنظیمات سایت</h3>
            <p className="text-gray-600 mb-4">ویرایش اطلاعات درباره ما و تماس با ما</p>
            <a href="/admin1383/settings" className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition">
              تنظیمات
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
