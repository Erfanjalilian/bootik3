'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AlertCircle } from 'lucide-react';
import type { AuthUser } from '@/lib/auth/types';

export default function UsersManagement() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      setUsers(await response.json());
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AdminLayout currentPage="users"><div className="text-center py-12">در حال بارگذاری...</div></AdminLayout>;
  }

  return (
    <AdminLayout currentPage="users">
      <div className="space-y-4">
        {users.length === 0 && (
          <div className="bg-blue-100 text-blue-800 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            هنوز کاربری در سیستم نیست.
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-right">شناسه</th>
                <th className="px-4 py-3 text-right">شماره تلفن</th>
                <th className="px-4 py-3 text-right">تاریخ عضویت</th>
                <th className="px-4 py-3 text-right">آخرین بازدید</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{user.id}</td>
                  <td className="px-4 py-3">{user.phone}</td>
                  <td className="px-4 py-3">
                    {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(user.lastSeenAt).toLocaleDateString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>کل کاربران:</strong> {users.length}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
