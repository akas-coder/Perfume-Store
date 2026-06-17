import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiPackage, FiTag, FiShoppingBag, FiUsers, FiPercent,
  FiImage, FiStar, FiArchive, FiLogOut, FiMenu, FiX, FiBell
} from 'react-icons/fi';
import { adminAuthAPI } from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { icon: FiGrid, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: FiPackage, label: 'Products', to: '/admin/products' },
  { icon: FiTag, label: 'Categories', to: '/admin/categories' },
  { icon: FiShoppingBag, label: 'Orders', to: '/admin/orders' },
  { icon: FiUsers, label: 'Customers', to: '/admin/customers' },
  { icon: FiPercent, label: 'Coupons', to: '/admin/coupons' },
  { icon: FiImage, label: 'Banners', to: '/admin/banners' },
  { icon: FiStar, label: 'Reviews', to: '/admin/reviews' },
  { icon: FiArchive, label: 'Inventory', to: '/admin/inventory' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check admin auth on mount
  useEffect(() => {
    const token = localStorage.getItem('perfume_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    adminAuthAPI.me().then(res => {
      if (!res.data.success) {
        localStorage.removeItem('perfume_admin_token');
        navigate('/admin/login');
      }
    }).catch(() => {
      localStorage.removeItem('perfume_admin_token');
      navigate('/admin/login');
    });
  }, [navigate]);

  const handleLogout = async () => {
    try { await adminAuthAPI.logout(); } catch { /* ignore */ }
    localStorage.removeItem('perfume_admin_token');
    toast.success('Admin logged out');
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #E8C96A, #D4AF37)' }}>
            <span className="text-black font-bold text-sm">P</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-display text-lg font-semibold text-gold-gradient">PERfume</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Admin Panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                active ? 'btn-gold' : 'hover:bg-white hover:bg-opacity-5'
              }`}
              style={{ color: active ? '#0A0A0A' : 'var(--color-muted)' }}
            >
              <item.icon size={18} />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all hover:bg-white hover:bg-opacity-5"
          style={{ color: '#EF4444' }}
        >
          <FiLogOut size={18} />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-black)' }}>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          height: '100vh',
        }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden flex flex-col"
              style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                setMobileSidebarOpen(!mobileSidebarOpen);
              }}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <FiMenu size={20} />
            </button>
            <h1 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>
              {navItems.find(n => n.to === location.pathname)?.label || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors relative"
                    style={{ color: 'var(--color-muted)' }}>
              <FiBell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                 style={{ background: 'var(--color-gold)', color: 'var(--color-black)' }}>
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
