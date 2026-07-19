'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ShoppingCart, Eye, X, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import type { Order } from '@/lib/orders/types';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'پرداخت شده', color: 'bg-green-100 text-green-800' },
  failed: { label: 'ناموفق', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'لغو شده', color: 'bg-gray-100 text-gray-800' },
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'در انتظار پرداخت' },
  { value: 'paid', label: 'پرداخت شده' },
  { value: 'failed', label: 'ناموفق' },
  { value: 'cancelled', label: 'لغو شده' },
];

function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR');
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatId(id: string): string {
  return id.slice(0, 8) + '...';
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus as Order['status'] } : o))
        );
        if (selectedOrder?.id === id) {
          setSelectedOrder((prev) => prev ? { ...prev, status: newStatus as Order['status'] } : null);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'خطا در تغییر وضعیت');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('خطا در تغییر وضعیت');
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const paidOrders = orders.filter((o) => o.status === 'paid').length;
  const failedOrders = orders.filter((o) => o.status === 'failed').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === '' ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackId?.toString().includes(searchTerm) ||
      order.shippingAddress.firstName.includes(searchTerm) ||
      order.shippingAddress.lastName.includes(searchTerm) ||
      order.shippingAddress.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statCards = [
    { title: 'کل سفارشات', value: totalOrders, color: 'bg-blue-500' },
    { title: 'در انتظار پرداخت', value: pendingOrders, color: 'bg-yellow-500' },
    { title: 'پرداخت شده', value: paidOrders, color: 'bg-green-500' },
    { title: 'ناموفق / لغو شده', value: failedOrders + orders.filter((o) => o.status === 'cancelled').length, color: 'bg-red-500' },
    { title: 'درآمد کل', value: formatPrice(totalRevenue) + ' تومان', color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <AdminLayout currentPage="orders">
        <div className="text-center py-12">در حال بارگذاری...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="orders">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className={`${card.color} p-2 rounded-lg`}>
                  <ShoppingCart size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{card.title}</p>
                  <p className="text-lg font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در سفارشات (شناسه، پیگیری، نام، تلفن)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]"
              >
                <option value="all">همه وضعیت‌ها</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
              <p>هیچ سفارشی یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm">شناسه</th>
                    <th className="px-4 py-3 text-right text-sm">مشتری</th>
                    <th className="px-4 py-3 text-right text-sm">تلفن</th>
                    <th className="px-4 py-3 text-right text-sm">تاریخ</th>
                    <th className="px-4 py-3 text-right text-sm">مبلغ</th>
                    <th className="px-4 py-3 text-right text-sm">کد پیگیری</th>
                    <th className="px-4 py-3 text-right text-sm">وضعیت</th>
                    <th className="px-4 py-3 text-right text-sm">اقلام</th>
                    <th className="px-4 py-3 text-center text-sm">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <>
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono">{formatId(order.id)}</td>
                        <td className="px-4 py-3 text-sm">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm">{order.shippingAddress.phone}</td>
                        <td className="px-4 py-3 text-sm">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3 text-sm font-bold">{formatPrice(order.totalAmount)} تومان</td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {order.trackId ? order.trackId : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              STATUS_MAP[order.status]?.color || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {STATUS_MAP[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {order.items.length} عدد
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                              title="مشاهده جزئیات"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() =>
                                setExpandedRow(expandedRow === order.id ? null : order.id)
                              }
                              className="p-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
                              title="تغییر وضعیت"
                            >
                              {expandedRow === order.id ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRow === order.id && (
                        <tr key={`${order.id}-expand`} className="bg-gray-50">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm text-gray-600">تغییر وضعیت:</span>
                              {STATUS_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  onClick={() => handleStatusChange(order.id, opt.value)}
                                  disabled={order.status === opt.value}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                    order.status === opt.value
                                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                      : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  جزئیات سفارش {formatId(selectedOrder.id)}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">شناسه سفارش</p>
                    <p className="font-mono text-sm">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">کد پیگیری (زرین‌پال)</p>
                    <p className="font-mono text-sm">{selectedOrder.trackId || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">شماره مرجع</p>
                    <p className="font-mono text-sm">{selectedOrder.refNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاریخ ثبت</p>
                    <p className="text-sm">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاریخ پرداخت</p>
                    <p className="text-sm">
                      {selectedOrder.paidAt ? formatDate(selectedOrder.paidAt) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">وضعیت</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        STATUS_MAP[selectedOrder.status]?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">اطلاعات مشتری</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">نام</p>
                      <p className="text-sm font-semibold">
                        {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">تلفن</p>
                      <p className="text-sm font-semibold" dir="ltr">{selectedOrder.shippingAddress.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">آدرس</p>
                      <p className="text-sm font-semibold">
                        {selectedOrder.shippingAddress.province}، {selectedOrder.shippingAddress.city}
                      </p>
                      <p className="text-sm">{selectedOrder.shippingAddress.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">کد پستی</p>
                      <p className="text-sm font-semibold" dir="ltr">{selectedOrder.shippingAddress.postalCode}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">اقلام سفارش</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <div className="flex gap-3 text-sm text-gray-500 mt-1">
                            <span>رنگ: {item.color}</span>
                            <span>سایز: {item.size}</span>
                            <span>تعداد: {item.quantity}</span>
                          </div>
                          <p className="text-sm font-bold text-blue-600 mt-1">
                            {formatPrice(item.price)} تومان
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">مبلغ کل:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(selectedOrder.totalAmount)} تومان
                  </span>
                </div>

                {/* Status Change */}
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-800 mb-3">تغییر وضعیت</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(selectedOrder.id, opt.value)}
                        disabled={selectedOrder.status === opt.value}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedOrder.status === opt.value
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-600">
          نمایش {filteredOrders.length} از {orders.length} سفارش
        </div>
      </div>
    </AdminLayout>
  );
}