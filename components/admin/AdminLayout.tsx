'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, LogOut, LayoutDashboard, Package, Image as ImageIcon, Users, ShoppingCart, Settings, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export function AdminLayout({ children, currentPage = 'dashboard' }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setShowLoginForm(false);
    }
  }, []);

  // Close mobile sidebar when changing pages
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [currentPage]);

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
        <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">پنل مدیریتی</h1>
          <p className="text-center text-gray-600 mb-8">رز مد</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور را وارد کنید"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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

  const navItems = [
    { href: '/admin1383', label: 'داشبورد', icon: LayoutDashboard },
    { href: '/admin1383/products', label: 'محصولات', icon: Package },
    { href: '/admin1383/banners', label: 'بنرها', icon: ImageIcon },
    { href: '/admin1383/users', label: 'کاربران', icon: Users },
    { href: '/admin1383/orders', label: 'سفارشات', icon: ShoppingCart },
    { href: '/admin1383/settings', label: 'تنظیمات', icon: Settings },
  ];

  const isActive = (href: string) =>
    currentPage === href.split('/').pop() ||
    (currentPage === 'dashboard' && href === '/admin1383');

  const renderNav = (showLabels: boolean) => (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive(href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Icon size={20} />
            {showLabels && <span>{label}</span>}
          </button>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      {/* Sidebar - Desktop (md and up) */}
      <div
        className={`hidden md:flex ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex-col shrink-0`}
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

        {renderNav(sidebarOpen)}

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

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 md:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">پنل مدیریتی</h2>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {renderNav(true)}

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
          >
            <LogOut size={20} />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg shrink-0"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-base sm:text-2xl font-bold text-gray-800 truncate">
              {currentPage === 'dashboard' && 'داشبورد'}
              {currentPage === 'products' && 'مدیریت محصولات'}
              {currentPage === 'banners' && 'مدیریت بنرها'}
              {currentPage === 'users' && 'مدیریت کاربران'}
              {currentPage === 'orders' && 'مدیریت سفارشات'}
              {currentPage === 'settings' && 'تنظیمات سایت'}
            </h1>
          </div>
          <div className="text-gray-600 text-xs sm:text-sm shrink-0">
            {new Date().toLocaleDateString('fa-IR')}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}