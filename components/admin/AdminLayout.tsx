'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, LogOut, LayoutDashboard, Package, Image as ImageIcon, Users, ShoppingCart, Settings, AlertCircle, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export function AdminLayout({ children, currentPage = 'dashboard' }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setShowLoginForm(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper authentication)
    if (password === '1383') {
      setIsAuthenticated(true);
      setShowLoginForm(false);
      sessionStorage.setItem('admin_auth', 'true');
      setPassword('');
    } else {
      alert('رمز عبور نادرست است');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setShowLoginForm(true);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">پنل مدیریتی</h1>
          <p className="text-center text-gray-600 mb-8">رز مد</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور را وارد کنید"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
            >
              ورود
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold">پنل مدیریتی</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { href: '/admin1383', label: 'داشبورد', icon: LayoutDashboard },
            { href: '/admin1383/products', label: 'محصولات', icon: Package },
            { href: '/admin1383/banners', label: 'بنرها', icon: ImageIcon },
            { href: '/admin1383/users', label: 'کاربران', icon: Users },
            { href: '/admin1383/orders', label: 'سفارشات', icon: ShoppingCart },
            { href: '/admin1383/settings', label: 'تنظیمات', icon: Settings },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  currentPage === href.split('/').pop() || 
                  (currentPage === 'dashboard' && href === '/admin1383')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{label}</span>}
              </button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>خروج</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            {currentPage === 'dashboard' && 'داشبورد'}
            {currentPage === 'products' && 'مدیریت محصولات'}
            {currentPage === 'banners' && 'مدیریت بنرها'}
            {currentPage === 'users' && 'مدیریت کاربران'}
            {currentPage === 'orders' && 'مدیریت سفارشات'}
            {currentPage === 'settings' && 'تنظیمات سایت'}
          </h1>
          <div className="text-gray-600 text-sm">
            {new Date().toLocaleDateString('fa-IR')}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
