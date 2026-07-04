import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX,
  FiLogOut, FiPackage, FiSettings, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest('#user-menu-wrapper')) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Collections', to: '/products' },
    { label: 'Men', to: '/products?gender=MEN' },
    { label: 'Women', to: '/products?gender=WOMEN' },
    { label: 'Luxury', to: '/products?isLuxury=true' },
    { label: 'Fragrance Quiz', to: '/quiz' },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          (scrolled || location.pathname !== '/') ? 'glass-dark shadow-2xl border-b border-white/5' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #E8C96A, #D4AF37)' }}>
                <svg width="18" height="18" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="22" y="28" width="20" height="24" rx="4" fill="#0A0A0A" opacity="0.8"/>
                  <rect x="27" y="20" width="10" height="10" rx="2" fill="#0A0A0A" opacity="0.8"/>
                  <rect x="25" y="14" width="14" height="8" rx="3" fill="#0A0A0A" opacity="0.9"/>
                  <rect x="38" y="17" width="5" height="3" rx="1.5" fill="#0A0A0A" opacity="0.7"/>
                </svg>
              </div>
              <span className="font-display text-2xl font-semibold text-gold-gradient tracking-widest">
                Liorix
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium tracking-wider uppercase transition-all duration-200 relative"
                  style={{ color: isActive(link.to) ? 'var(--color-gold)' : 'var(--color-cream)', opacity: isActive(link.to) ? 1 : 0.8 }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-gold)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = isActive(link.to) ? 'var(--color-gold)' : 'var(--color-cream)';
                    e.currentTarget.style.opacity = isActive(link.to) ? '1' : '0.8';
                  }}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                          style={{ background: 'var(--color-gold)' }} />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/5"
                style={{ color: 'var(--color-cream)' }}
                id="search-btn"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>

              {/* Wishlist (desktop only) */}
              {isLoggedIn && (
                <Link to="/wishlist"
                      className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/5"
                      style={{ color: 'var(--color-cream)' }}
                      aria-label="Wishlist">
                  <FiHeart size={20} />
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart"
                    className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/5"
                    style={{ color: 'var(--color-cream)' }}
                    aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}>
                <FiShoppingBag size={20} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold badge-gold"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* User Menu (desktop) */}
              {isLoggedIn ? (
                <div className="relative hidden sm:block" id="user-menu-wrapper">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full transition-all duration-200 hover:scale-105"
                    id="user-menu-btn"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-transparent hover:ring-yellow-400/30 transition-all"
                         style={{ background: 'var(--color-gold)', color: 'var(--color-black)' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden glass"
                        style={{ border: '1px solid rgba(212, 175, 55, 0.2)', top: '100%' }}
                      >
                        <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{user?.name}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
                        </div>
                        {[
                          { icon: FiUser, label: 'My Profile', to: '/profile' },
                          { icon: FiPackage, label: 'My Orders', to: '/orders' },
                          { icon: FiHeart, label: 'Wishlist', to: '/wishlist' },
                        ].map(item => (
                          <Link key={item.to} to={item.to}
                            className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-white/5"
                            style={{ color: 'var(--color-cream)' }}
                          >
                            <item.icon size={15} style={{ color: 'var(--color-gold)' }} />
                            {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-red-500/10"
                          style={{ color: '#F87171', borderTop: '1px solid rgba(212,175,55,0.1)' }}
                        >
                          <FiLogOut size={15} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login"
                  className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium btn-outline-gold"
                  id="login-btn"
                >
                  <FiUser size={15} /> Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/5"
                style={{ color: 'var(--color-cream)' }}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[-1]"
                style={{ background: 'rgba(0,0,0,0.6)', top: '64px' }}
                onClick={() => setMobileOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden overflow-y-auto"
                style={{
                  background: 'rgba(10,10,10,0.98)',
                  backdropFilter: 'blur(20px)',
                  borderTop: '1px solid rgba(212,175,55,0.15)',
                  maxHeight: 'calc(100vh - 64px)'
                }}
              >
                {/* User info (if logged in) */}
                {isLoggedIn && (
                  <div className="px-5 py-4 flex items-center gap-3"
                       style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                         style={{ background: 'var(--color-gold)', color: 'var(--color-black)' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-cream)' }}>{user?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                <div className="px-4 py-3 space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link to={link.to}
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium tracking-wider uppercase transition-colors"
                        style={{
                          color: isActive(link.to) ? 'var(--color-gold)' : 'var(--color-cream)',
                          background: isActive(link.to) ? 'rgba(212,175,55,0.08)' : 'transparent'
                        }}
                      >
                        {link.label}
                        <FiChevronRight size={14} style={{ color: 'var(--color-muted)' }} />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Divider */}
                <div className="mx-4 my-1" style={{ height: '1px', background: 'rgba(212,175,55,0.1)' }} />

                {/* User actions */}
                {isLoggedIn ? (
                  <div className="px-4 py-3 space-y-1">
                    {[
                      { icon: FiUser, label: 'My Profile', to: '/profile' },
                      { icon: FiPackage, label: 'My Orders', to: '/orders' },
                      { icon: FiHeart, label: 'Wishlist', to: '/wishlist' },
                    ].map(item => (
                      <Link key={item.to} to={item.to}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-colors hover:bg-white/5"
                        style={{ color: 'var(--color-cream)' }}
                      >
                        <item.icon size={16} style={{ color: 'var(--color-gold)' }} />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-colors hover:bg-red-500/10"
                      style={{ color: '#F87171' }}
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-4 flex gap-3">
                    <Link to="/login" className="flex-1 py-3 text-center rounded-xl text-sm font-medium btn-outline-gold">
                      Login
                    </Link>
                    <Link to="/register" className="flex-1 py-3 text-center rounded-xl text-sm font-medium btn-gold">
                      Register
                    </Link>
                  </div>
                )}

                {/* Bottom padding */}
                <div className="h-4" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center px-4"
            style={{
              background: 'rgba(10,10,10,0.96)',
              backdropFilter: 'blur(20px)',
              paddingTop: 'max(6rem, env(safe-area-inset-top, 0px) + 5rem)'
            }}
            onClick={() => setSearchOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)', color: 'white' }}
              aria-label="Close search"
            >
              <FiX size={20} />
            </button>

            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <form onSubmit={handleSearch} className="relative">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" size={20}
                          style={{ color: 'var(--color-muted)' }} />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search fragrances, brands..."
                  className="w-full pl-14 pr-16 py-5 rounded-2xl text-lg input-dark"
                  id="search-input"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl btn-gold"
                  aria-label="Submit search"
                >
                  <FiSearch size={18} />
                </button>
              </form>
              <p className="text-center mt-4 text-xs sm:text-sm" style={{ color: 'var(--color-muted)' }}>
                Press <kbd className="px-1.5 py-0.5 rounded text-xs"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Enter</kbd> to search ·{' '}
                <kbd className="px-1.5 py-0.5 rounded text-xs"
                     style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Esc</kbd> to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
